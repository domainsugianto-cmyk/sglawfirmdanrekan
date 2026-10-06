import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata = {
  title: 'Kantor Hukum SG Law Firm dan Rekan | Advokat & Pengacara Profesional',
  description: 'Kantor Hukum SG Law Firm dan Rekan - Layanan jasa konsultasi dan pinjakan hukum profesional oleh tim Advokat dan Asisten Kuasa Hukum Pajak berpengalaman.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
