export type CustomerPrintInfo = {
  name?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
};

export type CustomerPrintValidation = {
  isPrintable: boolean;
  missingFields: string[];
  warningMessage: string;
};

/**
 * Validates if a customer has name, contact (phone number), and address.
 * If any of them is missing, printing receipt/return invoice is disallowed.
 */
export function getCustomerPrintValidation(
  customer?: CustomerPrintInfo | null
): CustomerPrintValidation {
  const missingFields: string[] = [];

  const hasName = Boolean(customer?.name && customer.name.trim().length > 0);
  const hasPhone = Boolean(
    customer?.phoneNumber && customer.phoneNumber.trim().length > 0
  );
  const hasAddress = Boolean(
    customer?.address && customer.address.trim().length > 0
  );

  if (!hasName) missingFields.push("name");
  if (!hasPhone) missingFields.push("contact number");
  if (!hasAddress) missingFields.push("address");

  const isPrintable = missingFields.length === 0;

  let warningMessage = "";
  if (!isPrintable) {
    if (missingFields.length === 1) {
      warningMessage = `Invoice cannot be printed: customer ${missingFields[0]} is missing.`;
    } else if (missingFields.length === 2) {
      warningMessage = `Invoice cannot be printed: customer ${missingFields[0]} and ${missingFields[1]} are missing.`;
    } else {
      warningMessage = `Invoice cannot be printed: customer ${missingFields.slice(0, -1).join(", ")}, and ${missingFields[missingFields.length - 1]} are missing.`;
    }
  }

  return {
    isPrintable,
    missingFields,
    warningMessage,
  };
}
