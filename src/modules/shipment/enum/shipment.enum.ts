export enum DeliveryStatusEnum {
  PENDING = "pending",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
export enum MedicineFormEnum {
  TABLET = "Tablet",
  CAPSULE = "Capsule",
  SYRUP = "Syrup",
  INJECTION = "Injection",
  CREAM = "Cream",
  OINTMENT = "Ointment",
  DROPS = "Drops",
  INHALER = "Inhaler",
  SUPPOSITORY = "Suppository",
  POWDER = "Powder",
}
export enum ShipmentMode {
  AIR = "AIR",
  SEA = "SEA",
  LAND = "LAND",
}
export enum ShipmentUnitType {
  SINGLE_PACK = "SINGLE_PACK",
  BOX = "BOX",
  CARTON = "CARTON",
}