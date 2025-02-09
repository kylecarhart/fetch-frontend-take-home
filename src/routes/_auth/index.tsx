import { client } from "@/clients/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { BoneIcon, DogIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth";

export const Route = createFileRoute("/_auth/")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const auth = useAuth();
  const [selectedBreed, setSelectedBreed] = useState<string>();
  const [page, setPage] = useState(1);
  const [ageMin, setAgeMin] = useState<number>();
  const [ageMax, setAgeMax] = useState<number>();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      auth.logout().then(() => {
        router.invalidate().finally(() => {
          navigate({ to: "/" });
        });
      });
    }
  };

  const { data: breeds } = useQuery({
    queryKey: ["breeds"],
    queryFn: client.getBreeds,
  });

  const { data: searchDogsResponse } = useQuery({
    queryKey: ["searchDogs", selectedBreed, ageMin, ageMax],
    queryFn: () =>
      client.searchDogs({
        ...(selectedBreed && { breeds: [selectedBreed] }),
        ...(ageMin && { ageMin }),
        ...(ageMax && { ageMax }),
      }),
  });

  const dogs = useQuery({
    queryKey: ["dogs", searchDogsResponse?.resultIds],
    queryFn: () => client.getDogs(searchDogsResponse?.resultIds ?? []),
  });

  return (
    <div className="grid h-screen grid-cols-[350px,1fr] gap-4">
      {/* Sidebar */}
      <div className="space-y-4 border-r p-8">
        <div className="flex items-center gap-2">
          <DogIcon className="size-6" />
          <h1 className="text-2xl font-bold">Shelter Match</h1>
        </div>

        <div>
          <Select
            value={selectedBreed}
            onValueChange={setSelectedBreed}
            defaultValue={breeds?.[0]}
          >
            <Label>Breed</Label>
            <SelectTrigger>
              <SelectValue placeholder="Select a breed" />
            </SelectTrigger>
            <SelectContent>
              {breeds?.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Age Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={ageMin}
              placeholder="0"
              onChange={(e) => setAgeMin(Number(e.target.value))}
            />
            -
            <Input
              type="number"
              value={ageMax}
              placeholder="15"
              onChange={(e) => setAgeMax(Number(e.target.value))}
            />
          </div>
        </div>
        <Button>
          <BoneIcon className="size-4" /> Go!
        </Button>
      </div>
      {/* Main */}
      <div className="grid grid-cols-3 overflow-y-scroll p-8 xl:grid-cols-5">
        {dogs?.data?.map((dog) => (
          <div
            key={dog.id}
            style={{
              backgroundImage: `url(${dog.img})`,
            }}
            className="aspect-square bg-cover bg-center"
          >
            <div className="relative">
              {/* <Heart className="absolute top-0 size-6 text-red-500" /> */}
            </div>
            <h2>{dog.name}</h2>
            <div>
              <p>{dog.age}</p>
              <p>{dog.breed}</p>
              <p>{dog.zip_code}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
