import * as Yup from "yup"

export const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email("invalid email")
        .required("required"),
    password: Yup.string()
        .required("required")
})

export const SignupSchema = Yup.object().shape({
    email: Yup.string()
        .email("invalid email")
        .required("required"),
    password: Yup.string()
        .min(6, "min 6 characters")
        .required("required"),
    name: Yup.string()
        .required("required")
})

export const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email("invalid email")
        .required("required")
})

export const ResetPasswordSchema = Yup.object().shape({
    new_password: Yup.string()
        .min(6, "min 6 characters")
        .required("required")
})
