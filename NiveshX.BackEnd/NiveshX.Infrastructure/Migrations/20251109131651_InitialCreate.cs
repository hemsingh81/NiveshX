using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NiveshX.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsEmailConfirmed = table.Column<bool>(type: "bit", nullable: false), 
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefreshTokenExpiry = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPhoneConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    LastLoginOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProfilePictureUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsLockedOut = table.Column<bool>(type: "bit", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "system"),
                    ModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedBy", "CreatedOn", "Email", "FailedLoginAttempts", "IsActive", "IsEmailConfirmed", "IsLockedOut", "IsPhoneConfirmed", "LastLoginOn", "ModifiedBy", "ModifiedOn", "Name", "PasswordHash", "PhoneNumber", "ProfilePictureUrl", "RefreshToken", "RefreshTokenExpiry", "Role" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), "system", new DateTime(2025, 11, 8, 0, 0, 0, 0, DateTimeKind.Utc), "admin@niveshx.com", 0, true, true, false, false, null, null, null, "Hem Singh", "$2a$11$7SacvvnY60SyyWyDD/lmsuNvANz/cR5.763EBaidcDmL.y53UjOXS", null, null, "", new DateTime(2025, 12, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Admin" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
