-- CreateTable
CREATE TABLE "WhatsAppSettings" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "displayText" TEXT NOT NULL DEFAULT 'تواصل معنا عبر واتساب',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "position" TEXT NOT NULL DEFAULT 'bottom-right',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'مرحباً! كيف يمكنني مساعدتك؟',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppSettings_pkey" PRIMARY KEY ("id")
);
