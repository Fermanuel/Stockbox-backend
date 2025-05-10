import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async findAll() {
    try {
    
      const categories = await this.dbService.category.findMany({
        where: {
          isActive: true
        },
      });

      if(!categories)
      {
        return new BadRequestException('No categories found');
      }

      return categories;

    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
      
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
    
      const category = await this.dbService.category.findUnique({
        where: {
          id
        }
      });

      if (!category) {
        return new BadRequestException('Category not found');
      }

      const updatedCategory = await this.dbService.category.update({
        where: {
          id
        },
        data: {
          name: updateCategoryDto.name,
          description: updateCategoryDto.description ? updateCategoryDto.description : 'No description',
        }
      });

      return updatedCategory;


    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async remove(id: number) {
    try {
    
      const category = await this.dbService.category.findUnique({
        where: {
          id
        }
      });

      if (!category) {
        return new BadRequestException('Category not found');
      }

      const deletedCategory = await this.dbService.category.update({
        where: {
          id
        },
        data: {
          isActive: false
        }
      });

      return deletedCategory;

    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
      
    }
  }

  private handleDBError(error: any): never {
  
      if (error instanceof BadRequestException) {
        // Ya es una excepción con código 400
        throw error;
      }
  
      if (error.code === '23505') {
        // Violación de unicidad → 400 Bad Request
        throw new BadRequestException(error.detail);
      }
  
      // Cualquier otro error → 500 Internal Server Error
      throw new InternalServerErrorException('Error en la base de datos');
    }
}
