import { Loader } from "@/components/ui/loader";

export default function Loading() {
    return (
        <div className="flex h-[100dvh] w-full items-center justify-center bg-black">
            <Loader />
        </div>
    );
}
