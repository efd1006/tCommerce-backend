import { MetaTagsDto } from '../shared-dtos/meta-tags.dto';
import { BlogPost } from '../../../blog/models/blog-post.model';
import { AdminLinkedProductDto } from './linked-product.dto';
import { LinkedBlogPost } from '../../../blog/models/linked-blog-post.model';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { AdminMediaDto } from './media.dto';
import { transliterate } from '../../helpers/transliterate.function';
import { LinkedBlogCategory } from '../../../blog/models/linked-blog-category.model';

export class LinkedBlogCategoryDto implements LinkedBlogCategory {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  slug: string;
}

export class LinkedBlogPostDto implements LinkedBlogPost {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsOptional() // todo remove @IsOptional after migrate
  @IsString()
  name: string;

  @Expose()
  @IsOptional() // todo remove @IsOptional after migrate
  @IsString()
  slug: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  sortOrder: number;
}

export class AdminBlogPostCreateDto implements Record<keyof Omit<BlogPost, '_id' | 'id'>, any> {
  id?: any; // todo remove after migrate

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @Transform((slug, post) => slug === '' ? transliterate(post.name) : slug)
  slug: string;

  @Expose()
  @ValidateNested()
  category: LinkedBlogCategoryDto;

  @Expose()
  @IsString()
  content: string;

  @Expose()
  @IsString()
  shortContent: string;

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @IsDate()
  @Type(() => Date)
  publishedAt: Date;

  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @IsBoolean()
  isEnabled: boolean;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => LinkedBlogPostDto)
  linkedPosts: LinkedBlogPostDto[];

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => AdminLinkedProductDto)
  linkedProducts: AdminLinkedProductDto[];

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => AdminMediaDto)
  medias: AdminMediaDto[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaTagsDto)
  metaTags: MetaTagsDto;

  @Expose()
  @IsOptional()
  @IsNumber()
  sortOrder: number;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminMediaDto)
  featuredMedia: AdminMediaDto;
}

export class AdminBlogPostDto extends AdminBlogPostCreateDto implements Pick<BlogPost, 'id'> {
  @Expose()
  id: number;
}

