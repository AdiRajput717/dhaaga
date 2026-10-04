import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import BrandIntro from '@/components/BrandIntro'
import ProductGrid from '@/components/ProductGrid'
import Categories from '@/components/Categories'
import Story from '@/components/Story'
import FeaturedCollection from '@/components/FeaturedCollection'
import BannerSection from '@/components/BannerSection'
import Craftsmanship from '@/components/Craftsmanship'
import Instagram from '@/components/Instagram'
import Newsletter from '@/components/Newsletter'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="top">
        {/* 1. Hero */}
        <Hero />

        {/* 2. Brand intro quote */}
        <BrandIntro />

        {/* 3. New Arrivals */}
        <ProductGrid
          id="new"
          category="new"
          title="New Arrivals"
          subtitle="Made for your everyday jashn."
        />

        {/* 4. Shop by Category */}
        <Categories />

        {/* 5. Brand Story */}
        <Story />

        {/* 6. Featured Collection (dark navy section) */}
        <FeaturedCollection />

        {/* 7. Bestsellers */}
        <ProductGrid
          id="best"
          category="bestseller"
          title="Most Loved"
          subtitle="Pieces you'll want to wear again and again."
        />

        {/* 8. Immersive banner */}
        <BannerSection />

        {/* 9. Craftsmanship / Why Dhaaga */}
        <Craftsmanship />

        {/* 10. Instagram */}
        <Instagram />

        {/* 11. Newsletter */}
        <Newsletter />

        {/* 12. CTA Section */}
        <CTA />
      </main>

      {/* 13. Footer */}
      <Footer />
    </>
  )
}
