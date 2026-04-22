import ReactCountryFlag from "react-country-flag"

type CountryFlagIconProps = {
  countryCode: string
  /** Use lazy for long lists; eager for above-the-fold triggers. */
  loading?: "eager" | "lazy"
}

/**
 * Wraps react-country-flag with consistent sizing. The library sets inline
 * dimensions on the underlying img; we override to match Tailwind `size-4`.
 */
export function CountryFlagIcon({
  countryCode,
  loading = "lazy",
}: CountryFlagIconProps) {
  return (
    <ReactCountryFlag
      svg
      className="shrink-0"
      countryCode={countryCode.toUpperCase()}
      style={{ width: "1rem", height: "1rem" }}
      title=""
      aria-hidden
      loading={loading}
    />
  )
}
