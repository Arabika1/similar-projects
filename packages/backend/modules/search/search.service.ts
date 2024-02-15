import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { GithubService } from 'providers/github/github.service';
import { IResponse } from './search.interfaces';
import { IRepositoryData } from 'providers/github/github.intefaces';

@Injectable()
export class SearchService {
  constructor(
    private readonly logger: PinoLogger,
    private githubService: GithubService,
  ) {
    this.logger.setContext(SearchService.name);
  }

  private groupRepositories(repositories: IRepositoryData[][]): IResponse[] {
    const counts: { [name: string]: { url: string; count: number } } = repositories.flat().reduce((result, data) => {
      const key = data.name;
      if (!result[key]) {
        result[key] = { url: data.url, count: 1 };
      } else {
        result[key].count += 1;
      }
      return result;
    }, {});
  
    const sortedNames = Object.keys(counts)
      .map(name => ({ name, url: counts[name].url, count: counts[name].count }))
      .sort((a, b) => b.count - a.count);
  
    return sortedNames;
  }
  

  async getRepositories(url: string): Promise<IResponse[]> {
    try {
    const contributors = await this.githubService.getRepositoryContributors(url)
    const repositories = await this.githubService.getUsersRepositories(contributors)
    const groupedRepositories = this.groupRepositories(repositories)

    return groupedRepositories.slice(0, 5)
    } catch(e) {
      this.logger.error(e)
      return []
    }
  }
}
