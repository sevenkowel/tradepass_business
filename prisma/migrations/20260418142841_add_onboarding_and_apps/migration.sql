-- CreateTable
CREATE TABLE "tenant_onboardings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "step" INTEGER NOT NULL DEFAULT 1,
    "data" TEXT NOT NULL DEFAULT '{}',
    "deadline" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tenant_onboardings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tenant_apps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'installed',
    "installed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalled_at" DATETIME,
    CONSTRAINT "tenant_apps_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "app_catalogs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "app_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'app',
    "category" TEXT NOT NULL DEFAULT 'other',
    "dependencies" TEXT NOT NULL DEFAULT '[]',
    "is_official" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_onboardings_tenant_id_key" ON "tenant_onboardings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_apps_tenant_id_app_id_key" ON "tenant_apps"("tenant_id", "app_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_catalogs_app_id_key" ON "app_catalogs"("app_id");
