import { Injectable, Logger } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class CategoryService {

  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly dbService: DbService
  ){}

  async create(createCategoryDto: CreateCategoryDto) {
  
    try {
    
      // Check if the category already exists
      const existingCategory = await this.dbService.category.findUnique({
        where: {
          name: createCategoryDto.name
        }
      });

      if (existingCategory) {
        this.logger.warn(`Category with name ${createCategoryDto.name} already exists`);
        return;
      }
      
      // Create the new category
      await this.dbService.category.create({
        data: {
          name: createCategoryDto.name,
          description: createCategoryDto.description ? createCategoryDto.description : 'No description',
        }
      });

      return {
        message: 'Category created successfully',
      };

    } catch (error) {
      
    }
  }

  async findAll() {
    return `This action returns all category`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  async remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
