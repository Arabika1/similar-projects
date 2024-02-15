import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { GithubModule } from 'providers/github/github.module';

@Module({
  imports: [GithubModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
