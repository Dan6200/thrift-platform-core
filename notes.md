
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