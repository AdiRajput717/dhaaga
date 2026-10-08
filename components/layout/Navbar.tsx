"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { NAV_LINKS } from "@/lib/content";
import { getProducts, Product } from "@/lib/api/products";
import { useAuth } from "@/context/AuthContext";

import gsap from "gsap";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchRequestRef = useRef(0);

  /*
   * ---------------------------------------
   * NAVBAR SCROLL
   * ---------------------------------------
   */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
   * ---------------------------------------
   * SEARCH — OPEN FROM OTHER COMPONENTS
   * ---------------------------------------
   */

  useEffect(() => {
    const handler = () => {
      setSearchFocused(true);

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    };

    window.addEventListener("dhaaga:opensearch", handler);

    return () => {
      window.removeEventListener("dhaaga:opensearch", handler);
    };
  }, []);

  /*
   * ---------------------------------------
   * LIVE PRODUCT SEARCH
   * ---------------------------------------
   */

  useEffect(() => {
    const query = searchQuery.trim();

    // Don't search for empty/very short queries.
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      const requestId = ++searchRequestRef.current;

      setSearchLoading(true);

      try {
        const response = await getProducts({
          q: query,
          page: 1,
          limit: 6,
        });

        // Prevent older requests from overwriting newer results.
        if (requestId !== searchRequestRef.current) {
          return;
        }

        setSearchResults(response.products || []);
      } catch (error) {
        console.error("Product search failed:", error);

        if (requestId === searchRequestRef.current) {
          setSearchResults([]);
        }
      } finally {
        if (requestId === searchRequestRef.current) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  /*
   * ---------------------------------------
   * CLOSE SEARCH WHEN CLICKING OUTSIDE
   * ---------------------------------------
   */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          event.target as Node
        )
      ) {
        setSearchFocused(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * ---------------------------------------
   * CLEAR SEARCH
   * ---------------------------------------
   */

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchFocused(true);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  /*
   * ---------------------------------------
   * LOGOUT
   * ---------------------------------------
   */

  const handleLogout = async () => {
    try {
      await logout();
      setAccountMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /*
   * ---------------------------------------
   * RENDER
   * ---------------------------------------
   */

  return (
    <header
      className={`navbar ${scrolled ? "scrolled" : ""}`}
    >
      <div className="navbar-inner">

        {/* LOGO */}
        <Link
          href="/"
          className="navbar-logo"
          aria-label="Dhaaga-E-Jashn"
        >
          <Image
            src="/images/logo.png"
            alt="Dhaaga-E-Jashn"
            width={150}
            height={50}
            priority
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          className="nav-links"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="nav-actions">

          {/* =================================
              SEARCH
          ================================= */}

          <div
            className="nav-search"
            ref={searchContainerRef}
          >
            <form
              className="nav-search-form"
              onSubmit={(event) => {
                // Live search handles searching.
                // Don't navigate to a separate search page.
                event.preventDefault();
              }}
            >
              {/* Search icon */}
              <svg
                className="nav-search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-4-4" />
              </svg>

              {/* Search input */}
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => {
                  setSearchFocused(true);
                }}
                placeholder="Search kurtas, kurtis..."
                aria-label="Search products"
                className="nav-search-input"
                autoComplete="off"
              />

              {/* Clear */}
              {searchQuery && (
                <button
                  type="button"
                  className="nav-search-clear"
                  aria-label="Clear search"
                  onClick={clearSearch}
                >
                  ×
                </button>
              )}
            </form>

            {/* =================================
                SEARCH RESULTS
            ================================= */}

            {searchFocused &&
              searchQuery.trim().length >= 2 && (
                <div
                  className="nav-search-dropdown"
                  role="listbox"
                >
                  {/* Loading */}
                  {searchLoading ? (
                    <div className="nav-search-status">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="nav-search-heading">
                        Search results
                      </div>

                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          href={`/shop/${product.slug}`}
                          className="nav-search-result"
                          onClick={() => {
                            setSearchFocused(false);
                            setSearchQuery("");
                          }}
                        >
                          {/* Product image */}
                          <div className="nav-search-image">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                              />
                            ) : (
                              <div className="nav-search-image-placeholder" />
                            )}
                          </div>

                          {/* Product information */}
                          <div className="nav-search-result-info">
                            <span className="nav-search-result-name">
                              {product.name}
                            </span>

                            <span className="nav-search-result-price">
                              ₹
                              {product.price.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </>
                  ) : (
                    <div className="nav-search-status">
                      No products found for "
                      {searchQuery}"
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* =================================
              WISHLIST
          ================================= */}

          <Link
            href="/wishlist"
            className="icon-btn hide-mobile"
            aria-label="Wishlist"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
              />
            </svg>
          </Link>

          {/* =================================
              ACCOUNT
          ================================= */}

          <div className="account-wrapper">
            <button
              className="icon-btn"
              aria-label="Account"
              onClick={() =>
                setAccountMenuOpen((value) => !value)
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path
                  d="M4 21a8 8 0 0 1 16 0"
                />
              </svg>
            </button>

            {accountMenuOpen && (
              <div className="account-dropdown">

                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                    >
                      My Account
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                    >
                      Orders
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                    >
                      Create Account
                    </Link>
                  </>
                )}

              </div>
            )}
          </div>

          {/* =================================
              CART
          ================================= */}

          <Link
            href="/cart"
            className="icon-btn"
            aria-label="Shopping bag"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M6 8h12l1 13H5L6 8Z"
              />

              <path
                d="M9 8a3 3 0 0 1 6 0"
              />
            </svg>
          </Link>

          {/* =================================
              CTA
          ================================= */}

          <Link
            href="/shop"
            className="nav-cta"
          >
            Shop Now
          </Link>

          {/* =================================
              MOBILE MENU
          ================================= */}

          <button
            className="mobile-menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((value) => !value)
            }
          >
            <span />
            <span />
            <span />
          </button>

        </div>
      </div>

      {/* =====================================
          MOBILE MENU
      ===================================== */}

      {menuOpen && (
        <div className="mobile-menu">

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-menu-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/shop"
            className="mobile-menu-link"
            onClick={() => setMenuOpen(false)}
          >
            Shop Now
          </Link>

        </div>
      )}

    </header>
  );
}