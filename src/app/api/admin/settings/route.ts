import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  orderNotifications: z.boolean(),
  lowStockAlerts: z.boolean(),
  maintenanceMode: z.boolean(),
});

export async function GET() {
  try {
    const settingsList = await prisma.setting.findMany();

    // Convert list of settings to a key-value object
    const settings = settingsList.reduce((acc: Partial<z.infer<typeof settingsSchema>>, setting: { key: string; value: string }) => {
      const schemaKey = setting.key as keyof z.infer<typeof settingsSchema>;
      // Check if the key exists in the schema and if the schema type is boolean
      if (schemaKey in settingsSchema.shape) {
        const expectedType = settingsSchema.shape[schemaKey];
        if (expectedType instanceof z.ZodBoolean) {
           // Safely parse boolean string to boolean
           acc[schemaKey] = setting.value === 'true';
        } else {
           // For other types (if any), assign directly
           acc[schemaKey] = setting.value as any; // Use any as a fallback, or add specific handling for other types
        }
      } else {
         // If key not in schema, assign as is (optional, depending on desired behavior for unknown keys)
         (acc as any)[setting.key] = setting.value; // Assign unknown keys as any
      }
      return acc;
    }, {} as Partial<z.infer<typeof settingsSchema>>);

    // Provide default values if settings are not in the database
    const defaultSettings: z.infer<typeof settingsSchema> = {
      emailNotifications: true,
      orderNotifications: true,
      lowStockAlerts: true,
      maintenanceMode: false,
    };

    const finalSettings = { ...defaultSettings, ...settings };

    return NextResponse.json(finalSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Update or create settings in the database
    const updatePromises = Object.entries(validatedData).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key: key },
        update: { value: String(value) }, // Store boolean as string
        create: { key: key, value: String(value) },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Configurações salvas com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Erro ao salvar configurações' },
      { status: 500 }
    );
  }
} 