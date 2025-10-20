import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { role, name, phone, email, password } = await req.json()
        console.log(role, name, phone, email, password)

        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            return new NextResponse("User already registered", { status: 403 })
        }

        // hashing the password
        const hashedPassword = await hash(password, 10)

        const newUser = await db.user.create({
            data: {
                role, name, phone, email, password: hashedPassword
            }
        })

        const projects = await db.project.findMany({ select: { id: true } });

        // Assign the new user to all projects
        if (projects.length > 0) {
            await db.projectAssignment.createMany({
                data: projects.map((p) => ({
                    userId: newUser.id,
                    projectId: p.id,
                })),
            });
        }

        // Send welcome email with credentials
        await sendWelcomeEmail(newUser, password);

        // uses to remove the hashed password for safety
        const { password: newUserPassword, ...rest } = newUser;
        return NextResponse.json({ user: rest, message: 'Portal user created successfully' }, { status: 201 });
    } catch (error) {
        console.error("[USER_REGISTRATION]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

async function sendWelcomeEmail(user: any, plainPassword: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASS,
        },
    });

    const roleColor: any = {
        Admin: "#dc2626",
        Manager: "#0ea5e9",
        User: "#10b981",
        'software-engineer': "#8b5cf6",
        Designer: "#f59e0b",
        viewer: "#64748b",
    };

    const appUrl = "https://task-tracker-r58v.vercel.app/";

    try {
        const info = await transporter.sendMail({
            from: `"Task Tracker" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: `Welcome to Task Tracker, ${user.name}!`,
            text: `Welcome to Task Tracker, ${user.name}!!

Hello ${user.name},

Your account has been successfully created! We're excited to have you on board.

Your Account Details:
-------------------
Name: ${user.name}
Email: ${user.email}
Password: ${plainPassword}
Role: ${user.role}
Phone: ${user.phone}

Important Security Steps:
------------------------
1. Please change your password after your first login for security purposes
2. You can set up a PIN for quick access in your account settings
3. Keep your credentials secure and do not share them with anyone

Getting Started:
---------------
1. Visit the application at: ${appUrl}
2. Log in using your email and the password provided above
3. Complete your profile setup
4. Explore your dashboard and assigned projects

If you have any questions or need assistance, please contact your system administrator.

Best regards,
The Team`,
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Task Tracker</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #f8fafc; color: #334155;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to Task Tracker</h1>
                    <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">Task Management System</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 40px 30px;">
                    <!-- Greeting -->
                    <div style="margin-bottom: 30px;">
                        <p style="font-size: 18px; color: #475569; margin: 0 0 10px 0;">Hello <strong style="color: #1e293b;">${user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #64748b; margin: 0; line-height: 1.6;">Your account has been successfully created! We're excited to have you on board as part of our team.</p>
                    </div>

                    <!-- Role Badge -->
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="display: inline-block; background: ${roleColor[user.role] || '#0ea5e9'}; color: white; padding: 10px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                            ${user.role.toUpperCase()}
                        </div>
                    </div>

                    <!-- Account Details Card -->
                    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 30px; border-left: 4px solid ${roleColor[user.role] || '#0ea5e9'}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 30px;">
                        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">Your Account Credentials</h2>
                        
                        <div style="background: white; border-radius: 12px; padding: 25px; margin: 20px 0;">
                            <div style="display: grid; gap: 18px;">
                                <div>
                                    <div style="font-weight: 600; color: #475569; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Full Name</div>
                                    <div style="color: #1e293b; font-size: 16px; font-weight: 500;">${user.name}</div>
                                </div>
                                
                                <div style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
                                    <div style="font-weight: 600; color: #475569; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Email Address</div>
                                    <div style="color: #1e293b; font-size: 16px; font-weight: 500;">${user.email}</div>
                                </div>
                                
                                <div style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
                                    <div style="font-weight: 600; color: #475569; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</div>
                                    <div style="background: #fef3c7; color: #92400e; padding: 14px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; letter-spacing: 1.5px; border: 2px dashed #fbbf24; text-align: center;">${plainPassword}</div>
                                    <div style="color: #dc2626; font-size: 13px; margin-top: 8px; font-weight: 600;">⚠ Please change this password after your first login</div>
                                </div>
                                
                                <div style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
                                    <div style="font-weight: 600; color: #475569; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Phone Number</div>
                                    <div style="color: #1e293b; font-size: 16px; font-weight: 500;">${user.phone}</div>
                                </div>

                                <div style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
                                    <div style="font-weight: 600; color: #475569; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Role</div>
                                    <div style="color: #1e293b; font-size: 16px; font-weight: 600;">${user.role}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Security Tips -->
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                        <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0; font-weight: 700;">Security Guidelines</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                            <li style="margin-bottom: 8px; line-height: 1.5;"><strong>Change your password</strong> after your first login for enhanced security</li>
                            <li style="margin-bottom: 8px; line-height: 1.5;"><strong>Set up a PIN</strong> in your account settings for quick and secure access</li>
                            <li style="margin-bottom: 0; line-height: 1.5;"><strong>Keep your credentials secure</strong> and never share them with anyone</li>
                        </ul>
                    </div>

                    <!-- Getting Started -->
                    <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                        <h3 style="color: #075985; font-size: 16px; margin: 0 0 12px 0; font-weight: 700;">Getting Started</h3>
                        <ol style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                            <li style="margin-bottom: 8px; line-height: 1.5;">Click the button below to access the application</li>
                            <li style="margin-bottom: 8px; line-height: 1.5;">Log in using your email and the password provided above</li>
                            <li style="margin-bottom: 8px; line-height: 1.5;">Complete your profile setup and change your password</li>
                            <li style="margin-bottom: 0; line-height: 1.5;">Explore your dashboard and assigned projects</li>
                        </ol>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${appUrl}" style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.4); transition: all 0.3s;">
                            Access Your Dashboard →
                        </a>
                        <p style="color: #94a3b8; font-size: 13px; margin: 12px 0 0 0;">${appUrl}</p>
                    </div>

                    <!-- Support -->
                    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                        <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.6;">
                            Need help getting started? Have questions?<br>
                            <strong style="color: #475569;">Contact your system administrator for assistance.</strong>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">
                            Welcome aboard! We're thrilled to have you as part of the team.
                        </p>
                        <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
                            This is an automated email from  Task Tracker System by Adil Saaly.<br>
                            Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `,
        });

        console.log(`Welcome email sent to ${user.email}:`, info.messageId);
    } catch (err) {
        console.error(`Failed to send welcome email to ${user.email}:`, err);
    }
}   