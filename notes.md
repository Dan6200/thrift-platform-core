---

## Media Management Strategy (Custom vs. Strapi)

**Context:**
This section clarifies the recommended approach for media management, considering the implementation of a General-Purpose Media Management System (Issue #7) and the integration of Strapi CMS (Issue #24).

**Recommendation:**
A **hybrid approach** is recommended, leveraging the strengths of both systems:

1.  **Custom Media Management System (Issue #7) for Core Application Assets:**
    *   **Purpose:** This system should primarily handle media that is tightly coupled with core application data and logic.
    *   **Examples:** User avatars, product images (especially variant-specific images, multiple angles, optimized for e-commerce display), and store logos/banners.
    *   **Reasoning:**
        *   **Tight Integration:** These assets are directly linked to critical data models (`profiles`, `products`, `stores`). Managing them via a custom system allows for precise control over their lifecycle, linking, and optimization within the core application flow.
        *   **Performance & Optimization:** E-commerce platforms often require highly optimized image processing (resizing, cropping, watermarking) and efficient delivery for a large volume of product images. A custom system provides the granular control needed for these performance-critical aspects.
        *   **Specific Business Logic:** Custom business rules (e.g., mandatory images per variant, specific aspect ratios, approval workflows) can be more naturally implemented and enforced within a custom system.
        *   **Decoupling from CMS:** Core application data should ideally be independent of the CMS. This prevents vendor lock-in for critical assets if the CMS changes in the future.

2.  **Strapi CMS Media Library (as part of Issue #24) for General Content Media:**
    *   **Purpose:** Strapi's built-in media library is ideal for managing media associated with less structured content.
    *   **Examples:** Images for blog posts, marketing pages, news articles, static content, and general website assets that are managed directly through the CMS.
    *   **Reasoning:**
        *   **Out-of-the-Box Functionality:** Strapi provides a mature, user-friendly media library with upload, management, and basic transformation capabilities, significantly reducing development effort.
        *   **Content Creator Experience:** Content creators can manage content and its associated media directly within the Strapi admin panel, providing a seamless experience.

**Implementation Strategy (Phased Coexistence):**

*   **Start with Coexistence (Option A):** Implement Issue #7 and Issue #24 independently, allowing each system to manage media within its defined scope. This is the simpler approach to begin with, as it avoids complex interdependencies initially.
*   **Defer Deeper Integration (Option B):** The more advanced integration, where the custom media system becomes the single source of truth and Strapi is customized to use it, can be deferred. This would involve developing custom Strapi upload providers and potentially modifying content type fields, which adds significant complexity. This can be considered as a future enhancement if a truly unified media library becomes a critical requirement.

This hybrid approach allows the platform to benefit from the rapid development and content management capabilities of Strapi while maintaining the necessary control and optimization for core e-commerce assets.

---

## Headless CMS, DAM, and Database Structure

**Understanding the Roles:**

1.  **Core Database (Supabase):**
    *   **Source of Truth for Application Data:** All transactional data, user profiles, product catalog (structural data like price, SKU, variants), orders, reviews, and the *relationships* between content and application entities.
    *   **Stores References:** It will store IDs or URLs that point to content managed by the CMS and assets managed by the DAM.
    *   **Handles Business Logic:** User authentication, order processing, inventory management, etc.

2.  **Digital Asset Management (DAM):**
    *   **Source of Truth for Media Assets:** Stores, organizes, and manages all your raw image, video, and audio files.
    *   **Provides Asset Metadata:** Stores technical metadata (dimensions, format, creation date) and descriptive metadata (tags, keywords, captions).
    *   **Delivers Assets:** Provides optimized URLs for serving assets (often integrated with a CDN).
    *   **Handles Asset Transformations:** Resizing, cropping, format conversion.

3.  **Headless CMS:**
    *   **Source of Truth for Marketing/Editorial Content:** Manages structured content like blog posts, articles, landing page content, FAQs, promotional banners, and rich product descriptions.
    *   **Content Modeling:** Defines content types (e.g., "Blog Post," "Banner," "Product Feature").
    *   **Content Editing Interface:** Provides a user-friendly interface for content creators.
    *   **API-First Delivery:** Exposes content via APIs (REST, GraphQL) for consumption by your frontend and potentially other services.
    *   **Manages Content Relationships:** Links content pieces together (e.g., a blog post linking to a product).

**Integration Strategy:**

The key is to define clear boundaries and how each system references the others.

**1. Media Assets (DAM Integration):**

*   **DAM's Role:** All raw image, video, and audio files (including product images, user avatars, banners, promotional videos) are uploaded directly to and managed by the DAM. The DAM provides a unique ID and a public URL for each asset.
*   **Core Database's Role:**
    *   Your `media` table in Supabase will primarily store the *references* to assets in your DAM.
    *   `media.media_id`: Your internal primary key.
    *   `media.dam_asset_id`: The unique ID provided by your DAM for that asset.
    *   `media.url`: The public URL provided by your DAM (or a derived URL if you use DAM transformations).
    *   `media.filetype`: The MIME type (from DAM).
    *   `media.description`: A brief description (from DAM, or managed in CMS if it's rich content).
    *   `media.uploader_id`: Links to your `profiles` table.
    *   `product_media_links` and `profile_media` tables remain in your core DB to define relationships.
*   **Headless CMS's Role:**
    *   When content creators add images/videos to CMS content (e.g., a banner image, an image within a blog post), they will typically select these assets from the DAM via an integration (e.g., a DAM picker within the CMS editor).
    *   The CMS will then store the DAM's asset ID or URL within its content model.
    *   For banners and promotional videos, the CMS would define content types like "Banner" or "Promotional Video." These content types would have fields for the video/image URL (pulled from the DAM), title, call-to-action, etc.

**2. Marketing/Editorial Content (Headless CMS Integration):**

*   **Headless CMS's Role:** Manages all your dynamic, editorial content (blog posts, landing page text, FAQs, rich product descriptions).
*   **Core Database's Role:**
    *   For content that needs to be directly linked to your application's entities (e.g., a rich product description for a specific `product_id`), your `products` table might have a `cms_description_id` or `cms_content_id` field. When your application fetches product details, it would then make a separate API call to the CMS to retrieve the rich description.
    *   For pages and sections:
        *   `pages` table: `page_id`, `store_id`, `page_slug`, `page_type`. The `seo_data` could be a JSONB field in your DB, populated by data fetched from the CMS.
        *   `page_sections` table: `section_id`, `page_id`, `section_type`. The `section_data` (which is the actual content) would be replaced by a `cms_content_id` or a direct reference to the CMS content API endpoint.
*   **DAM's Role:** Provides the image/video assets that are embedded within the CMS content.

**Example Flow:**

1.  **Content Creator:**
    *   Logs into CMS.
    *   Creates a new "Blog Post" entry.
    *   Writes text in a rich text editor.
    *   Wants to add an image: uses the CMS's DAM integration to select an image from the DAM. The DAM provides the image URL.
    *   Saves the blog post. The CMS stores the text and the DAM image URL.

2.  **Developer:**
    *   Your frontend application needs to display the blog post.
    *   It calls the CMS API to get the blog post content.
    *   The CMS returns the text and the DAM image URL.
    *   The frontend renders the text and loads the image directly from the DAM's URL.

**Why this separation?**

*   **Clear Responsibilities:** Each system does what it does best.
*   **Scalability:** You can scale your content, assets, and application data independently.
*   **Flexibility:** Easily swap out one component (e.g., change CMS) without affecting others.
*   **Performance:** Assets are served directly from the DAM/CDN, reducing load on your application server.
*   **User Experience:** Content creators get specialized tools for content and asset management.