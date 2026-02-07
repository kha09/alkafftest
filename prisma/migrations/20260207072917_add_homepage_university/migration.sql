-- CreateTable
CREATE TABLE "HomePageUniversity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "ranking" TEXT NOT NULL,
    "students" TEXT NOT NULL,
    "programs" TEXT NOT NULL,
    "acceptance" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "freeOfferLetter" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HomePageUniversity_pkey" PRIMARY KEY ("id")
);
