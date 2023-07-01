import { PrismaClient, Prisma } from '@prisma/client';

export const prisma = new PrismaClient();

export const getModelFields = (modelName: string) => {
    const fieldObjects = Prisma.dmmf.datamodel.models
        .find((model) => model.name === modelName)
        ?.fields;

    if (!fieldObjects) throw new Error(`Model ${modelName} doesn't exist in the DB`);

    return {
        fieldObjects: fieldObjects,
        fields: fieldObjects?.map(({ name }) => name),
    };
}

export const getRegularModelFields = (modelName: string) => {
    const modelFields = getModelFields(modelName);

   const fieldObjects = modelFields.fieldObjects?.filter(({ kind }) => kind === 'scalar');

   return {
       fieldObjects: fieldObjects,
       fields: fieldObjects?.map(({ name }) => name),
   }
}