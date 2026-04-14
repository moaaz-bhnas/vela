import { useFormState } from "react-dom"
import { useTranslations } from "next-intl"

import { LOGIN_VIEW } from "@modules/account/templates/login"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { login } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const t = useTranslations("Account")
  const tAddr = useTranslations("ShippingAddress")
  const [message, formAction] = useFormState(login, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-base leading-6 font-semibold uppercase mb-6">{t("welcomeBack")}</h1>
      <p className="text-center text-sm leading-6 font-normal text-ui-fg-base mb-stack">
        {t("signInSubtitle")}
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={t("email")}
            name="email"
            type="email"
            title={tAddr("validEmailTitle")}
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label={t("password")}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          {t("signIn")}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-xs leading-5 font-normal mt-6">
        {t("notMember")}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          {t("joinUs")}
        </button>
        .
      </span>
    </div>
  )
}

export default Login
