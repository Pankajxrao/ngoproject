interface RestaurantModel {
  id: string;
  userId: string;

  restaurantName: string;
  address: string;

  location: {
    type: "Point";
    coordinates: [number, number]; 
  };

  verified: boolean;

  createdAt: Date;
  updatedAt: Date;
}