import { useState } from "react";

type QrFormData = {
  link: string;
  name: string;
  jobRole: string;
  idNo: string;
  phone: string;
  email: string;
  location: string;
  
};

const initialFormData: QrFormData = {
  link: "",
  name: "",
  jobRole: "",
  idNo: "",
  phone: "",
  email: "",
  location: ""
};

export default function App() {
  const [formData, setFormData] = useState<QrFormData>(initialFormData);
  const [qrSrc, setQrSrc] = useState("");
  const [isError, setIsError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const setField =
    (field: keyof QrFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setFormData((previous) => ({ ...previous, [field]: event.target.value }));
    };

  const getTrimmedData = (): QrFormData => {
    return {
      link: formData.link.trim(),
      name: formData.name.trim(),
      jobRole: formData.jobRole.trim(),
      idNo: formData.idNo.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      location: formData.location.trim()
    };
  };

  const buildDocsUrl = (trimmedData: QrFormData): string => {
    const details = {
      name: trimmedData.name,
      jobRole: trimmedData.jobRole,
      idNo: trimmedData.idNo,
      phone: trimmedData.phone,
      email: trimmedData.email,
      location: trimmedData.location,
      qrId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    };
    const json = JSON.stringify(details);
    const binaryString = Array.from(new TextEncoder().encode(json), (byte) =>
      String.fromCharCode(byte)
    ).join("");
    const params = new URLSearchParams();
    params.set("data", btoa(binaryString));
    return `${window.location.origin}/docs.html?${params.toString()}`;
  };

  const generateQR = (): void => {
    const trimmedData = getTrimmedData();
    const hasAnyVisibleValue = Object.values(trimmedData).some(
      (value) => value.trim().length > 0
    );

    if (hasAnyVisibleValue) {
      const target = trimmedData.link || buildDocsUrl(trimmedData);
      setQrSrc(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(target)}`
      );
      return;
    }

    setIsError(true);
    window.setTimeout(() => setIsError(false), 1000);
  };

  const downloadQr = async (): Promise<void> => {
    if (!qrSrc) return;

    setIsDownloading(true);
    try {
      const response = await fetch(qrSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container">
      <p>William&apos;s QRcode Generator</p>

      <div className="form">
        <input
          type="text"
          placeholder="Link (optional)"
          value={formData.link}
          onChange={setField("link")}
          className={isError ? "error" : ""}
        />
        <input
          type="text"
          placeholder="Name (optional)"
          value={formData.name}
          onChange={setField("name")}
          className={isError ? "error" : ""}
        />
        <input
          type="text"
          placeholder="Job Role (optional)"
          value={formData.jobRole}
          onChange={setField("jobRole")}
          className={isError ? "error" : ""}
        />
        <input
          type="text"
          placeholder="ID No (optional)"
          value={formData.idNo}
          onChange={setField("idNo")}
          className={isError ? "error" : ""}
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={setField("phone")}
          className={isError ? "error" : ""}
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={formData.email}
          onChange={setField("email")}
          className={isError ? "error" : ""}
        />
        <input
          type="text"
          placeholder="Location (optional)"
          value={formData.location}
          onChange={setField("location")}
          className={isError ? "error" : ""}
        />
      </div>

      <div id="output" className={qrSrc ? "show-img" : ""}>
        <img id="qrimg" src={qrSrc} alt="Generated QR code" />
      </div>

      <button type="button" onClick={generateQR}>
        Generate
      </button>
      <button
        type="button"
        onClick={downloadQr}
        disabled={!qrSrc || isDownloading}
        className="download-btn"
      >
        {isDownloading ? "Downloading..." : "Download QR"}
      </button>
    </div>
  );
}
