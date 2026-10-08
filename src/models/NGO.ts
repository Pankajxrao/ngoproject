interface NGOModel {
  id: string;
  userId: string;

  ngoName: string;
  address: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  verified: boolean;

  createdAt: Date;
  updatedAt: Date;
}