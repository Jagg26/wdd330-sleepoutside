import { setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ExternalServices("tents");
const productID = getParam("product");

const product = new ProductDetails(productID, dataSource);
product.init();
