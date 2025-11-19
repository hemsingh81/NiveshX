using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NiveshX.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMarketCalendar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarketCalendars",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    ExchangeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegularOpenTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    RegularCloseTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    PreMarketOpen = table.Column<TimeSpan>(type: "time", nullable: true),
                    PreMarketClose = table.Column<TimeSpan>(type: "time", nullable: true),
                    PostMarketOpen = table.Column<TimeSpan>(type: "time", nullable: true),
                    PostMarketClose = table.Column<TimeSpan>(type: "time", nullable: true),
                    HolidayDatesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SessionRulesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "system"),
                    ModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketCalendars", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketCalendars_Exchanges_ExchangeId",
                        column: x => x.ExchangeId,
                        principalTable: "Exchanges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketCalendars_ExchangeId",
                table: "MarketCalendars",
                column: "ExchangeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarketCalendars");
        }
    }
}
