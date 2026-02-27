import Tesseract from "tesseract.js";

export async function extractTransactionData(file) {
  const {
    data: { text },
  } = await Tesseract.recognize(file, "eng", {
    logger: (m) => console.log(m),
  });

  // -------- Amount ----------
  const amountMatch = text.match(/ETB\s?([\d,]+\.\d{2})/i);
  const amount = amountMatch
    ? parseFloat(amountMatch[1].replace(/,/g, ""))
    : 0;

  // -------- Date ----------
  const dateMatch = text.match(/(\d{1,2}-[A-Za-z]{3}-\d{4})/);
  const date = dateMatch
    ? new Date(dateMatch[1]).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  // -------- Description ----------
  const descMatch = text.match(
    /ETB\s?[\d,]+\.\d{2}\s+debited from[\s\S]*?transaction ID:\s*\w+/i
  );

  let description = descMatch
    ? descMatch[0].replace(/\s+/g, " ").trim()
    : "";

  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  const type = /debited/i.test(description)
    ? "expense"
    : "income";

  return { amount, date, description, type };
}