import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDTO } from './pagination-query.dto';

export class FetchDTO extends PaginationQueryDTO {
  @ApiProperty({ type: String, required: false, description: 'Search query' })
  @IsString()
  @IsOptional()
  search?: string;
}
