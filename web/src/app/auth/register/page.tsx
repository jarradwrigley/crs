import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">
          Device Registration
        </h1>

        <AuthForm mode="register" />

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
