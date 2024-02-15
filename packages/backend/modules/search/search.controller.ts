import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { IResponse } from './search.interfaces';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  private async getRepositories(@Query('url') url: string){//:Promise<IResponse[]> {
    console.log(11111, url, 1111)
    return 'Hello'
    //return this.searchService.getRepositories(url);
  }
}
