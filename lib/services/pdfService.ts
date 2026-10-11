import PDFDocument from "pdfkit";
import type {
  OccupancyRecapResult,
  DamageRecapResult,
} from "@/lib/services/recapService";

export type PdfMeta = {
  adminName: string;
  printedAt?: Date;
  filterDescription?: string;
};

function formatWibDateTime(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

function formatIndoDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateStr}T00:00:00.000Z`));
}

export function generateOccupancyRecapPdf(
  data: OccupancyRecapResult,
  meta: PdfMeta
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    const left = 40;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - left * 2; // 515.28

    // --- Header ---
    doc.fontSize(16).fillColor("#0f172a").font("Helvetica-Bold");
    doc.text("KAMPUSSPACE — SISTEM FASILITAS KAMPUS", left, 40);

    doc.fontSize(12).fillColor("#0284c7").font("Helvetica-Bold");
    doc.text("Laporan Rekapitulasi Okupansi Fasilitas", left, 62);

    doc
      .strokeColor("#0284c7")
      .lineWidth(2)
      .moveTo(left, 80)
      .lineTo(left + contentWidth, 80)
      .stroke();

    // --- Metadata Block ---
    const printedAtStr = formatWibDateTime(meta.printedAt || new Date());
    const periodStr = `${formatIndoDate(data.period.from)} s/d ${formatIndoDate(
      data.period.to
    )} (${data.period.dayCount} hari)`;

    doc.fontSize(8.5).font("Helvetica").fillColor("#334155");
    let metaY = 90;

    doc.text(`Periode Laporan  : ${periodStr}`, left, metaY);
    doc.text(
      `Tanggal Cetak    : ${printedAtStr} WIB`,
      left + contentWidth / 2,
      metaY
    );
    metaY += 13;

    doc.text(
      `Dicetak Oleh     : ${meta.adminName} (Administrator)`,
      left,
      metaY
    );
    if (meta.filterDescription) {
      doc.text(
        `Filter Diterapkan : ${meta.filterDescription}`,
        left + contentWidth / 2,
        metaY
      );
    }
    metaY += 18;

    // --- Summary Metrics Cards ---
    const cardHeight = 42;
    const cardGap = 8;
    const numCards = 4;
    const cardWidth = (contentWidth - cardGap * (numCards - 1)) / numCards;

    const cards = [
      {
        label: "Total Fasilitas",
        value: `${data.summary.totalFacilities}`,
      },
      {
        label: "Total Reservasi",
        value: `${data.summary.totalReservations}`,
      },
      {
        label: "Slot Terpakai",
        value: `${data.summary.totalUsedSlots} slot`,
      },
      {
        label: "Rata-rata Okupansi",
        value: `${data.summary.averageOccupancy}%`,
      },
    ];

    cards.forEach((card, idx) => {
      const cx = left + idx * (cardWidth + cardGap);
      doc
        .roundedRect(cx, metaY, cardWidth, cardHeight, 4)
        .fillAndStroke("#f8fafc", "#e2e8f0");

      doc
        .fontSize(7.5)
        .font("Helvetica")
        .fillColor("#64748b")
        .text(card.label, cx + 6, metaY + 7, {
          width: cardWidth - 12,
          align: "left",
        });

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#0f172a")
        .text(card.value, cx + 6, metaY + 20, {
          width: cardWidth - 12,
          align: "left",
        });
    });

    let tableY = metaY + cardHeight + 16;

    // --- Table Headers ---
    // Column definitions:
    // No (25), Fasilitas (155), Lokasi (95), Tipe (65), Slot Tersedia (55), Terpakai (55), % Okupansi (65)
    const cols = [
      { key: "no", title: "No", width: 25, align: "center" as const },
      { key: "name", title: "Fasilitas", width: 155, align: "left" as const },
      { key: "loc", title: "Lokasi", width: 95, align: "left" as const },
      { key: "type", title: "Tipe", width: 65, align: "left" as const },
      {
        key: "avail",
        title: "Kapasitas Slot",
        width: 55,
        align: "right" as const,
      },
      {
        key: "used",
        title: "Terpakai",
        width: 55,
        align: "right" as const,
      },
      {
        key: "rate",
        title: "Okupansi",
        width: 65,
        align: "right" as const,
      },
    ];

    function drawTableHeader(y: number) {
      doc
        .rect(left, y, contentWidth, 18)
        .fillColor("#0284c7")
        .fill();

      let x = left;
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff");
      cols.forEach((col) => {
        doc.text(col.title, x + 3, y + 4, {
          width: col.width - 6,
          align: col.align,
        });
        x += col.width;
      });
      return y + 18;
    }

    tableY = drawTableHeader(tableY);

    // --- Table Rows ---
    doc.font("Helvetica").fontSize(8);

    data.items.forEach((item, index) => {
      // Check page break
      if (tableY + 22 > doc.page.height - 45) {
        doc.addPage();
        tableY = drawTableHeader(40);
      }

      const rowHeight = 18;
      const isAlt = index % 2 === 1;

      if (isAlt) {
        doc
          .rect(left, tableY, contentWidth, rowHeight)
          .fillColor("#f8fafc")
          .fill();
      }

      // Border bottom
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(0.5)
        .moveTo(left, tableY + rowHeight)
        .lineTo(left + contentWidth, tableY + rowHeight)
        .stroke();

      let x = left;
      doc.font("Helvetica").fontSize(8).fillColor("#1e293b");

      // Col 1: No
      doc.text(`${index + 1}`, x + 3, tableY + 4, {
        width: cols[0].width - 6,
        align: "center",
      });
      x += cols[0].width;

      // Col 2: Name
      doc.font("Helvetica-Bold").text(item.facilityName, x + 3, tableY + 4, {
        width: cols[1].width - 6,
        align: "left",
        lineBreak: false,
      });
      x += cols[1].width;

      // Col 3: Location
      doc.font("Helvetica").text(item.location, x + 3, tableY + 4, {
        width: cols[2].width - 6,
        align: "left",
        lineBreak: false,
      });
      x += cols[2].width;

      // Col 4: Type
      doc.text(item.type, x + 3, tableY + 4, {
        width: cols[3].width - 6,
        align: "left",
        lineBreak: false,
      });
      x += cols[3].width;

      // Col 5: Total slots
      doc.text(`${item.totalOperatingSlots}`, x + 3, tableY + 4, {
        width: cols[4].width - 6,
        align: "right",
      });
      x += cols[4].width;

      // Col 6: Used slots
      doc.text(`${item.usedSlots}`, x + 3, tableY + 4, {
        width: cols[5].width - 6,
        align: "right",
      });
      x += cols[5].width;

      // Col 7: Rate
      const isHigh = item.occupancyRate >= 50;
      doc
        .font("Helvetica-Bold")
        .fillColor(isHigh ? "#0284c7" : "#1e293b")
        .text(`${item.occupancyRate}%`, x + 3, tableY + 4, {
          width: cols[6].width - 6,
          align: "right",
        });

      tableY += rowHeight;
    });

    // --- Table Total Summary Row ---
    if (tableY + 22 > doc.page.height - 45) {
      doc.addPage();
      tableY = 40;
    }

    doc
      .rect(left, tableY, contentWidth, 20)
      .fillColor("#e0f2fe")
      .fill();

    doc
      .strokeColor("#0284c7")
      .lineWidth(1)
      .moveTo(left, tableY)
      .lineTo(left + contentWidth, tableY)
      .moveTo(left, tableY + 20)
      .lineTo(left + contentWidth, tableY + 20)
      .stroke();

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#0369a1");
    // Span across columns
    const labelWidth = cols[0].width + cols[1].width + cols[2].width + cols[3].width;
    doc.text("TOTAL / RATA-RATA", left + 6, tableY + 5, {
      width: labelWidth - 12,
      align: "left",
    });

    let sumX = left + labelWidth;
    doc.text(`${data.summary.totalOperatingSlots}`, sumX + 3, tableY + 5, {
      width: cols[4].width - 6,
      align: "right",
    });
    sumX += cols[4].width;

    doc.text(`${data.summary.totalUsedSlots}`, sumX + 3, tableY + 5, {
      width: cols[5].width - 6,
      align: "right",
    });
    sumX += cols[5].width;

    doc.text(`${data.summary.averageOccupancy}%`, sumX + 3, tableY + 5, {
      width: cols[6].width - 6,
      align: "right",
    });

    // --- Page Numbering Footers ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text(
          `Halaman ${i + 1} dari ${range.count} • KampusSpace Facility Management System`,
          left,
          doc.page.height - 25,
          { align: "center", width: contentWidth }
        );
    }

    doc.end();
  });
}

export function generateDamageRecapPdf(
  data: DamageRecapResult,
  meta: PdfMeta
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    const left = 40;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - left * 2; // 515.28

    // --- Header ---
    doc.fontSize(16).fillColor("#0f172a").font("Helvetica-Bold");
    doc.text("KAMPUSSPACE — SISTEM FASILITAS KAMPUS", left, 40);

    doc.fontSize(12).fillColor("#dc2626").font("Helvetica-Bold");
    doc.text("Laporan Rekapitulasi Frekuensi Kerusakan Fasilitas", left, 62);

    doc
      .strokeColor("#dc2626")
      .lineWidth(2)
      .moveTo(left, 80)
      .lineTo(left + contentWidth, 80)
      .stroke();

    // --- Metadata Block ---
    const printedAtStr = formatWibDateTime(meta.printedAt || new Date());
    const periodStr = `${formatIndoDate(data.period.from)} s/d ${formatIndoDate(
      data.period.to
    )}`;

    doc.fontSize(8.5).font("Helvetica").fillColor("#334155");
    let metaY = 90;

    doc.text(`Periode Laporan  : ${periodStr}`, left, metaY);
    doc.text(
      `Tanggal Cetak    : ${printedAtStr} WIB`,
      left + contentWidth / 2,
      metaY
    );
    metaY += 13;

    doc.text(
      `Dicetak Oleh     : ${meta.adminName} (Administrator)`,
      left,
      metaY
    );
    if (meta.filterDescription) {
      doc.text(
        `Filter Diterapkan : ${meta.filterDescription}`,
        left + contentWidth / 2,
        metaY
      );
    }
    metaY += 18;

    // --- Summary Metrics Cards ---
    const cardHeight = 42;
    const cardGap = 8;
    const numCards = 4;
    const cardWidth = (contentWidth - cardGap * (numCards - 1)) / numCards;

    const cards = [
      {
        label: "Total Laporan",
        value: `${data.summary.totalReports}`,
      },
      {
        label: "Selesai Ditangani",
        value: `${data.summary.resolvedReports}`,
      },
      {
        label: "Sedang Dikerjakan",
        value: `${data.summary.inProgressReports}`,
      },
      {
        label: "Kategori Terbanyak",
        value: data.summary.topCategory || "-",
      },
    ];

    cards.forEach((card, idx) => {
      const cx = left + idx * (cardWidth + cardGap);
      doc
        .roundedRect(cx, metaY, cardWidth, cardHeight, 4)
        .fillAndStroke("#f8fafc", "#e2e8f0");

      doc
        .fontSize(7.5)
        .font("Helvetica")
        .fillColor("#64748b")
        .text(card.label, cx + 6, metaY + 7, {
          width: cardWidth - 12,
          align: "left",
        });

      doc
        .fontSize(10.5)
        .font("Helvetica-Bold")
        .fillColor("#0f172a")
        .text(card.value, cx + 6, metaY + 20, {
          width: cardWidth - 12,
          align: "left",
        });
    });

    let tableY = metaY + cardHeight + 16;

    // --- Table Headers ---
    // Columns: No(25), Fasilitas(135), Lokasi(85), Baru(40), Proses(40), Selesai(40), Ditolak(40), Total(45), Kategori Utama(65)
    // 25 + 135 + 85 + 40 + 40 + 40 + 40 + 45 + 65 = 515
    const cols = [
      { key: "no", title: "No", width: 25, align: "center" as const },
      { key: "name", title: "Fasilitas", width: 135, align: "left" as const },
      { key: "loc", title: "Lokasi", width: 85, align: "left" as const },
      { key: "new", title: "Baru", width: 40, align: "center" as const },
      { key: "prog", title: "Proses", width: 40, align: "center" as const },
      { key: "res", title: "Selesai", width: 40, align: "center" as const },
      { key: "rej", title: "Tolak", width: 40, align: "center" as const },
      { key: "tot", title: "Total", width: 45, align: "center" as const },
      {
        key: "top",
        title: "Kategori Utama",
        width: 65,
        align: "left" as const,
      },
    ];

    function drawTableHeader(y: number) {
      doc
        .rect(left, y, contentWidth, 18)
        .fillColor("#dc2626")
        .fill();

      let x = left;
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#ffffff");
      cols.forEach((col) => {
        doc.text(col.title, x + 2, y + 4, {
          width: col.width - 4,
          align: col.align,
        });
        x += col.width;
      });
      return y + 18;
    }

    tableY = drawTableHeader(tableY);

    // --- Table Rows ---
    doc.font("Helvetica").fontSize(7.5);

    data.items.forEach((item, index) => {
      if (tableY + 22 > doc.page.height - 45) {
        doc.addPage();
        tableY = drawTableHeader(40);
      }

      const rowHeight = 18;
      const isAlt = index % 2 === 1;

      if (isAlt) {
        doc
          .rect(left, tableY, contentWidth, rowHeight)
          .fillColor("#f8fafc")
          .fill();
      }

      doc
        .strokeColor("#e2e8f0")
        .lineWidth(0.5)
        .moveTo(left, tableY + rowHeight)
        .lineTo(left + contentWidth, tableY + rowHeight)
        .stroke();

      let x = left;
      doc.font("Helvetica").fontSize(7.5).fillColor("#1e293b");

      // No
      doc.text(`${index + 1}`, x + 2, tableY + 4, {
        width: cols[0].width - 4,
        align: "center",
      });
      x += cols[0].width;

      // Name
      doc.font("Helvetica-Bold").text(item.facilityName, x + 2, tableY + 4, {
        width: cols[1].width - 4,
        align: "left",
        lineBreak: false,
      });
      x += cols[1].width;

      // Location
      doc.font("Helvetica").text(item.location, x + 2, tableY + 4, {
        width: cols[2].width - 4,
        align: "left",
        lineBreak: false,
      });
      x += cols[2].width;

      // Baru
      doc.text(`${item.newCount}`, x + 2, tableY + 4, {
        width: cols[3].width - 4,
        align: "center",
      });
      x += cols[3].width;

      // Proses
      doc.text(`${item.inProgressCount}`, x + 2, tableY + 4, {
        width: cols[4].width - 4,
        align: "center",
      });
      x += cols[4].width;

      // Selesai
      doc.text(`${item.resolvedCount}`, x + 2, tableY + 4, {
        width: cols[5].width - 4,
        align: "center",
      });
      x += cols[5].width;

      // Tolak
      doc.text(`${item.rejectedCount}`, x + 2, tableY + 4, {
        width: cols[6].width - 4,
        align: "center",
      });
      x += cols[6].width;

      // Total
      doc.font("Helvetica-Bold").text(`${item.totalCount}`, x + 2, tableY + 4, {
        width: cols[7].width - 4,
        align: "center",
      });
      x += cols[7].width;

      // Kategori Utama
      doc.font("Helvetica").text(item.topCategory, x + 2, tableY + 4, {
        width: cols[8].width - 4,
        align: "left",
        lineBreak: false,
      });

      tableY += rowHeight;
    });

    // --- Table Total Summary Row ---
    if (tableY + 22 > doc.page.height - 45) {
      doc.addPage();
      tableY = 40;
    }

    doc
      .rect(left, tableY, contentWidth, 20)
      .fillColor("#fee2e2")
      .fill();

    doc
      .strokeColor("#dc2626")
      .lineWidth(1)
      .moveTo(left, tableY)
      .lineTo(left + contentWidth, tableY)
      .moveTo(left, tableY + 20)
      .lineTo(left + contentWidth, tableY + 20)
      .stroke();

    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#991b1b");
    const labelWidth = cols[0].width + cols[1].width + cols[2].width;
    doc.text("TOTAL LAPORAN", left + 4, tableY + 5, {
      width: labelWidth - 8,
      align: "left",
    });

    let sumX = left + labelWidth;
    doc.text(`${data.summary.newReports}`, sumX + 2, tableY + 5, {
      width: cols[3].width - 4,
      align: "center",
    });
    sumX += cols[3].width;

    doc.text(`${data.summary.inProgressReports}`, sumX + 2, tableY + 5, {
      width: cols[4].width - 4,
      align: "center",
    });
    sumX += cols[4].width;

    doc.text(`${data.summary.resolvedReports}`, sumX + 2, tableY + 5, {
      width: cols[5].width - 4,
      align: "center",
    });
    sumX += cols[5].width;

    doc.text(`${data.summary.rejectedReports}`, sumX + 2, tableY + 5, {
      width: cols[6].width - 4,
      align: "center",
    });
    sumX += cols[6].width;

    doc.text(`${data.summary.totalReports}`, sumX + 2, tableY + 5, {
      width: cols[7].width - 4,
      align: "center",
    });
    sumX += cols[7].width;

    doc.text(`Umum: ${data.summary.topCategory}`, sumX + 2, tableY + 5, {
      width: cols[8].width - 4,
      align: "left",
      lineBreak: false,
    });

    // --- Page Numbering Footers ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text(
          `Halaman ${i + 1} dari ${range.count} • KampusSpace Facility Management System`,
          left,
          doc.page.height - 25,
          { align: "center", width: contentWidth }
        );
    }

    doc.end();
  });
}
