import { Module } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { GithubService } from './github.service';

@Module({
  imports: [],
  providers: [GithubService, Octokit],
  exports: [GithubService],
})
export class GithubModule {}
