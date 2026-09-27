import { useEffect } from "react";
import { useRouter } from "next/router";

export default function BookOpdRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/patient/book");
    }, [router]);

    return (
        <div className="min-h-screen bg-[#F4FBFA] flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
    );
}
