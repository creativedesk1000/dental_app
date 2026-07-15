import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  // touched

  try {
    const { name, email, password, clinicName, subdomain } = await req.json();

    if (!email || !password || !clinicName || !subdomain) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    // Check if subdomain exists
    const existingClinic = await prisma.clinic.findUnique({ where: { subdomain } });
    if (existingClinic) {
      return NextResponse.json({ message: 'Subdomain already taken' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Clinic and Clinic Admin in a transaction
    const user = await prisma.$transaction(async (tx: any) => {
      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
          subdomain,
        },
      });

      return await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.CLINIC_ADMIN,
          clinicId: clinic.id,
        },
      });
    });

    return NextResponse.json({ 
      message: 'Registration successful', 
      user: { id: user.id, email: user.email, role: user.role, clinicId: user.clinicId } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
