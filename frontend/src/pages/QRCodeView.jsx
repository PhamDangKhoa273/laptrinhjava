import QRCode from "qrcode.react";

export default function QRCodeView({ value }) {
  return <QRCode value={value} />;
}