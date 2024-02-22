import { Check, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createTagSchema = z.object({
	title: z.string().min(3, { message: "Minimun 3 characters." }),
});

type CreateTagSchema = Zod.infer<typeof createTagSchema>;

export function CreateTagForm() {
	const { register, handleSubmit, watch, formState } =
		useForm<CreateTagSchema>({
			resolver: zodResolver(createTagSchema),
		});

	const queryClient = useQueryClient()

	function getSlugFromString(input: string): string {
		return input
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(/[^\w\s]/g, "")
			.replace(/\s+/g, "-");
	}

	const { mutateAsync } = useMutation({
		mutationFn: async ({ title }: CreateTagSchema) => {
			await new Promise((resolve) => setTimeout(resolve, 2000));

			await fetch("http://localhost:3333/tags", {
				method: "POST",
				body: JSON.stringify({
					title,
					slug,
					amountOfVideos: 0,
				}),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-tags'],
			})
		}
	});
	const slug = watch("title") ? getSlugFromString(watch("title")) : "";

	async function createTag({ title }: CreateTagSchema) {
		//delay 2s
		await mutateAsync({ title });
	}

	return (
		<form onSubmit={handleSubmit(createTag)} className="w-full space-y-6">
			<div className="space-y-2">
				<label className="text-sm font-medium block" htmlFor="name">
					Tag Name
				</label>
				<input
					{...register("title")}
					id="name"
					type="text"
					className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
				/>
				{formState.errors?.title && (
					<p className="text-sm text-red-400">
						{formState.errors.title.message}
					</p>
				)}
			</div>
			<div className="space-y-2">
				<label className="text-sm font-medium block" htmlFor="slug">
					Slug
				</label>
				<input
					id="slug"
					type="text"
					value={slug}
					readOnly
					className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
				/>
			</div>

			<div className="flex items-center justify-end gap-2">
				<Dialog.Close asChild>
					<Button>
						<X className="size-3" />
						Cancel
					</Button>
				</Dialog.Close>

				<Button
					disabled={formState.isSubmitting}
					className="bg-teal-400 text-zinc-950"
					type="submit"
				>
					{formState.isSubmitting ? (
						<Loader2 className="size-3 animate-spin" />
					) : (
						<Check className="size-3" />
					)}
					Save
				</Button>
			</div>
		</form>
	);
}
