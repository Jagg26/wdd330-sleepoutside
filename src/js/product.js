import { loadHeaderFooter, getParam } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

loadHeaderFooter();

const productID = getParam("product");
const dataSource = new ExternalServices();

const product = new ProductDetails(productID, dataSource);
product.init();
