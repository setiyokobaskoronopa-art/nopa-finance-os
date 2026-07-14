import { createEntityStore } from "@/store/createEntityStore";
import type {
  BusinessEntry,
  SalesOrder,
  ProductItem,
  CustomerItem,
  SupplierItem,
  BudgetRow,
  InvestmentRow,
  AssetRow,
  ReportRow,
} from "@/data/pagesDummy";
import type { PersonalTx } from "@/data/pagesDummy";

export const useBusinessStore = createEntityStore<BusinessEntry>("business");
export const useSalesStore = createEntityStore<SalesOrder>("sales");
export const useProductsStore = createEntityStore<ProductItem>("products");
export const useCustomersStore = createEntityStore<CustomerItem>("customers");
export const useSuppliersStore = createEntityStore<SupplierItem>("suppliers");
export const useBudgetStore = createEntityStore<BudgetRow>("budget");
export const useInvestmentStore = createEntityStore<InvestmentRow>("investment");
export const useAssetsStore = createEntityStore<AssetRow>("assets");
export const useReportsStore = createEntityStore<ReportRow>("reports");
export const usePersonalTxStore = createEntityStore<PersonalTx>("personal-tx");
