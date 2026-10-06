import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { getDbConnection } from '@/lib/db';
import TestimonialForm from '@/components/TestimonialForm';
import AboutMediaSlider from '@/components/AboutMediaSlider';

export const dynamic = 'force-dynamic'; // Ensure fresh CMS data is loaded

export default async function Home() {
  const db = await getDbConnection();

  // Fetch content
  const [contentRows] = await db.query('SELECT section, data FROM site_content');
  const siteContent = {};
  for (const row of contentRows) {
    siteContent[row.section] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  }

  // Fetch team
  const [teamMembers] = await db.query('SELECT * FROM team ORDER BY id ASC');

  // Fetch testimonials
  const [testimonials] = await db.query('SELECT * FROM testimonials WHERE is_approved = 1 ORDER BY id ASC');

  // Fetch gallery
  const [galleryRows] = await db.query('SELECT image_url FROM gallery ORDER BY position ASC, id ASC');
  const galleryImages = galleryRows.map(r => r.image_url);

  const { hero, about, advantages, contact, cta, footer } = siteContent;
  const heroStats = (hero.stats || []).map(stat => (
    stat.source === 'teamCount' ? { ...stat, value: String(teamMembers.length) } : stat
  ));

  const advantageIcons = [
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  ];

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGlow2} />
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              {hero.badge}
            </div>
            <h1>
              {hero.title} <span className={styles.heroAccent}>{hero.titleAccent}</span> {hero.titleEnd}
            </h1>
            <p>
              {hero.description}
            </p>
            <div className={styles.heroActions}>
              <Link href={`https://api.whatsapp.com/send/?phone=${contact.whatsapp}&text&type=phone_number&app_absent=0`} target="_blank" className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Hubungi Kami
              </Link>
              <Link href="#about" className="btn-outline">
                Pelajari Lebih Lanjut
              </Link>
            </div>
            <div className={styles.heroStats}>
              {heroStats.map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={styles.heroStat}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                  {i < heroStats.length - 1 && <div className={styles.heroStatDivider} />}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroLogoCard}>
              <Image
                src="/logo-new.jpg"
                alt="Logo Kantor Hukum SG Law Firm"
                width={320}
                height={320}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`section ${styles.aboutSection}`}>
        <div className={`container ${styles.aboutContainer}`}>
          <div className={styles.aboutImage}>
            <AboutMediaSlider
              media={Array.isArray(about.media) && about.media.length > 0
                ? about.media
                : [{ type: 'image', src: '/logo-new.jpg', alt: 'Logo SG Law Firm', fit: 'contain' }]}
            />
            <div className={styles.aboutImageOverlay}>
              <div className={styles.aboutImageBadge}>
                <strong>KANTOR HUKUM</strong>
                <span>SGLAWFIRM & REKAN</span>
              </div>
            </div>
          </div>
          <div className={styles.aboutText}>
            <span className={styles.labelTag}>TENTANG KAMI</span>
            <h2>{about.title}</h2>
            <p>{about.description}</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="attorneys" className={`section ${styles.teamSection}`}>
        <div className="container">
          <span className={styles.labelTagCenter}>TIM KAMI</span>
          <h2 className="section-title">Para Profesional di Balik Layanan Kami</h2>
          <p className={styles.sectionDesc}>
            KANTOR HUKUM SGLAWFIRM DAN REKAN terdiri dari Advokat dan Asisten Advokat / Asisten Kuasa Hukum Pajak yang berpengalaman
          </p>
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <div className={styles.teamCardNumber}>{String(index + 1).padStart(2, '0')}</div>
                <div className={styles.teamCardContent}>
                  <h4>{member.name}</h4>
                  {member.title && <p className={styles.teamTitle}>{member.title}</p>}
                  <span className={`${styles.teamRole} ${member.role === 'Advokat' ? styles.roleAdvokat : styles.roleAsisten}`}>
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="practice-areas" className={`section ${styles.servicesSection}`}>
        <div className="container">
          <span className={styles.labelTagCenter}>LAYANAN</span>
          <h2 className="section-title">Layanan Kami Meliputi</h2>
          <div className={styles.serviceShowcase}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconBox}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              </div>
              <h3>Jasa Akuntansi</h3>
              <p>Pengelolaan pembukuan dan akuntansi profesional</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconBox}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
              <h3>Pajak</h3>
              <p>Konsultasi dan penyelesaian masalah perpajakan</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconBox}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="14.31" y1="8" x2="20.05" y2="17.94" /><line x1="9.69" y1="8" x2="21.17" y2="8" /><line x1="7.38" y1="12" x2="13.12" y2="2.06" /><line x1="9.69" y1="16" x2="3.95" y2="6.06" /><line x1="14.31" y1="16" x2="2.83" y2="16" /><line x1="16.62" y1="12" x2="10.88" y2="21.94" /></svg>
              </div>
              <h3>Hukum</h3>
              <p>Pendampingan dan konsultasi hukum komprehensif</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className={`section ${styles.advantagesSection}`}>
        <div className="container">
          <span className={styles.labelTagCenterLight}>KEUNGGULAN</span>
          <h2 className="section-title" style={{ color: "white" }}>Keunggulan Kami</h2>
          <p className={styles.sectionDescLight}>
            Pilih kami sekarang dan nikmati keunggulan kami untuk mencapai hasil yang lebih baik!
          </p>
          <div className={styles.advantagesGrid}>
            {(advantages || []).map((item, index) => (
              <div key={index} className={styles.advantageCard}>
                <div className={styles.advantageIcon}>{advantageIcons[index % 4]}</div>
                <h3>{item.title}</h3>
                <p>{item.description || item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`section ${styles.testimonialSection}`}>
        <div className="container">
          <span className={styles.labelTagCenter}>TESTIMONI</span>
          <h2 className="section-title">Apa Kata Mereka</h2>
          <div className={styles.marqueeContainer}>
            <div className={styles.testimonialGrid}>
              {Array(4).fill(testimonials).flat().map((testimonial, index) => (
                <div key={index} className={styles.testimonialCard}>
                  <div className={styles.testimonialStars} style={{ color: '#fbbf24', letterSpacing: '2px', fontSize: '1.2rem' }}>
                    {'★'.repeat(testimonial.rating || 5)}{'☆'.repeat(5 - (testimonial.rating || 5))}
                  </div>
                  <p className={styles.testimonialText}>
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className={styles.testimonialAuthor}>
                    {testimonial.avatar ? (
                      <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} className={styles.testimonialAvatar} style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e2e8f0' }} />
                    )}
                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>Klien</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TestimonialForm />
        </div>
      </section>

      {/* Contact & Map Section */}
      <section id="contact" className={`section ${styles.contactSection}`}>
        <div className={`container ${styles.contactContainer}`}>
          <div className={styles.contactInfo}>
            <span className={styles.labelTag}>KONTAK</span>
            <h2>Segera Hubungi Kami</h2>
            <p className={styles.contactDesc}>Kami siap membantu Anda kapan saja. Jangan ragu untuk menghubungi kami.</p>
            <div className={styles.contactCards}>
              <div className={styles.contactCard}>
                <div className={styles.contactCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div>
                  <h4>Alamat</h4>
                  <p>{contact.address}</p>
                </div>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
                <div>
                  <h4>Jam Operasional</h4>
                  <p>{contact.hours}</p>
                </div>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                <div>
                  <h4>Telepon</h4>
                  <p>{contact.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contactMap}>
            <iframe
              src={`https://www.google.com/maps?q=${contact.mapQuery}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: "16px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: "center" }}>
          <h2>{cta.title}</h2>
          <p>{cta.description}</p>
          <Link href={`https://api.whatsapp.com/send/?phone=${contact.whatsapp}&text&type=phone_number&app_absent=0`} target="_blank" className={styles.ctaBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            KLIK DISINI
          </Link>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section">
        <div className="container">
          <span className={styles.labelTagCenter}>GALLERY</span>
          <h2 className="section-title">Dokumentasi Pekerjaan Kami</h2>
          <div className={styles.galleryGrid}>
            {galleryImages.map((src, index) => (
              <div key={index} className={styles.galleryItem}>
                <Image
                  src={src}
                  alt={`Dokumentasi Pekerjaan ${index + 1}`}
                  fill
                  style={{ objectFit: "contain", backgroundColor: "#f8fafc" }}
                />
                <div className={styles.galleryOverlay}>
                  <span>Foto {index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <Image src="/logo-new.jpg" alt="Logo" width={50} height={50} style={{ borderRadius: "12px" }} />
                <div>
                  <h3>Kantor Hukum SG Law Firm dan Rekan</h3>
                  <p>{footer.description}</p>
                </div>
              </div>
            </div>
            <div className={styles.footerSocials}>
              <h4>Follow Social Media Kami</h4>
              <div className={styles.socialIcons}>
                <a href={footer.youtube} target="_blank" rel="noreferrer" className={styles.socialIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
                <a href={footer.whatsapp} target="_blank" rel="noreferrer" className={styles.socialIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
                <a href={footer.tiktok} target="_blank" rel="noreferrer" className={styles.socialIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                </a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} Kantor Hukum SG Law Firm dan Rekan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
