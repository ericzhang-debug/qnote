-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteName" TEXT NOT NULL DEFAULT 'QNote',
    "siteTitle" TEXT NOT NULL DEFAULT 'QNote - 微语',
    "siteSubtitle" TEXT NOT NULL DEFAULT '记录生活中的每一句微语',
    "showIcp" BOOLEAN NOT NULL DEFAULT false,
    "icpNumber" TEXT NOT NULL DEFAULT '',
    "showGithub" BOOLEAN NOT NULL DEFAULT false,
    "githubUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
