import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { chunkArray } from 'common/utils';
import { PinoLogger } from 'nestjs-pino';
import {
  GITHUB_HOST,
  MAX_CONCURRENT_REQUESTS,
  MAX_PER_PAGE,
} from './constants';
import { ConfigService } from '@nestjs/config';
import { IContributor, IRepositoryData } from './github.intefaces';

@Injectable()
export class GithubService {
  constructor(
    private readonly logger: PinoLogger,
    private octokitClient: Octokit,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(GithubService.name);
    this.octokitClient = new Octokit({
      auth: `Bearer ${this.configService.get<string>('GITHUB_API_KEY')}`,
    });
  }

  private extractOwnerAndRepo(url: string) {
    try {
      const { pathname, host } = new URL(url);

      if (host !== GITHUB_HOST) {
        throw new Error('Not a GitHub URL');
      }

      const [owner, repo] = pathname.split('/').slice(1, 3);

      return { owner, repo };
    } catch (error) {
      this.logger.error('Invalid GitHub URL:', error.message);
      return null;
    }
  }

  private async getUserRepositories(
    username: string,
    repo: string,
    maxRetries: number = 3,
  ): Promise<IRepositoryData[]> {
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const paginator = this.octokitClient.paginate.iterator(
          this.octokitClient.repos.listForUser,
          {
            username,
            per_page: MAX_PER_PAGE,
          },
        );

        const repositories = [];
        for await (const page of paginator) {
          page.data.forEach((repository) => {
            if (repo !== repository.name) {
              repositories.push({
                url: repository.html_url,
                name: repository.name,
              });
            }
          });
        }

        return repositories;
      } catch (e) {
        this.logger.error({
          message: `Error fetching repositories for user ${username}. Retrying...`,
          error: e.message,
          metadata: { username },
        });

        retries++;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    this.logger.error({
      message: `Failed to fetch repositories after ${maxRetries} retries for user ${username}`,
      metadata: { username },
    });

    return [];
  }

  public async getRepositoryContributors(url: string): Promise<IContributor[]> {
    const { owner, repo } = this.extractOwnerAndRepo(url);
    try {
      const paginator = this.octokitClient.paginate.iterator(
        this.octokitClient.repos.listContributors,
        {
          owner,
          repo,
          per_page: MAX_PER_PAGE,
        },
      );

      const contributors = [];
      for await (const page of paginator) {
        page.data.forEach((contributor) => {
          contributors.push({
            login: contributor.login || '',
          });
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      return contributors;
    } catch (error) {
      if (
        error.message.includes(
          'too large to list contributors for this repository',
        )
      ) {
        this.logger.info({
          message: `Can't get contributors for repository ${repo}: too many contributors`,
          metadata: { owner, repo },
        });
        return [];
      }
      throw error;
    }
  }

  public async getUsersRepositories(
    usernames: IContributor[],
    url: string,
  ): Promise<IRepositoryData[][]> {
    const { repo } = this.extractOwnerAndRepo(url);
    const result = [];
    const chunks = chunkArray(usernames, MAX_CONCURRENT_REQUESTS);
    const fetchRepositoriesByChunks = async (chunk: { login: string }[]) => {
      const promises = chunk.map((username) =>
        this.getUserRepositories(username.login, repo),
      );
      return await Promise.all(promises);
    };

    for (const chunk of chunks) {
      const repositoriesChunk = await fetchRepositoriesByChunks(chunk);
      result.push(repositoriesChunk);
    }

    return result.flat();
  }
}
