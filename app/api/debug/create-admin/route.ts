import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role = "admin" } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await (prisma.user as any).findFirst({
      where: {
        OR: [
          { username },
          { email: username.includes("@") ? username : `${username}@smalkaff.com` }
        ]
      }
    });

    let user;
    if (existingUser) {
      // Update existing user
      user = await (prisma.user as any).update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          role
        }
      });
    } else {
      // Create new user
      user = await (prisma.user as any).create({
        data: {
          username,
          email: username.includes("@") ? username : `${username}@smalkaff.com`,
          password: hashedPassword,
          fullName: username,
          role
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `User '${username}' created/updated successfully`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
