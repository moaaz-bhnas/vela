"use client"

import { useFormState } from "react-dom"
import { useTranslations } from "next-intl"

import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const t = useTranslations("Account")
  const tS = useTranslations("ShippingAddress")
  const [message, formAction] = useFormState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-base leading-6 font-semibold uppercase mb-6">{t("becomeMember")}</h1>
      <p className="text-center text-sm leading-6 font-normal text-ui-fg-base mb-4">
        {t("registerSubtitle")}
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={tS("firstName")}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label={tS("lastName")}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label={tS("email")}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label={tS("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label={t("password")}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-xs leading-5 font-normal mt-6">
          {t("registerLegalA")}
          {t("registerLegalB")}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            {t("privacyPolicy")}
          </LocalizedClientLink>
          {t("registerLegalC")}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            {t("termsOfUse")}
          </LocalizedClientLink>
          {t("registerLegalD")}
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          {t("join")}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-xs leading-5 font-normal mt-6">
        {t("alreadyMember")}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {t("signIn")}
        </button>
        .
      </span>
    </div>
  )
}

export default Register
