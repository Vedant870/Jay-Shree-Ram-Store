import React, {
  useEffect,
  useState
} from 'react';

export default function AdminProducts() {

  const [products, setProducts] =
    useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {

    try {

      const response =
        await fetch("/api/products");

      const data =
        await response.json();

      setProducts(data.products || data);

    } catch (error) {

      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Products Management
        </h1>

        <div className="bg-white rounded-3xl p-6 overflow-auto shadow-sm">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left p-4">
                  Product
                </th>

                <th className="text-left p-4">
                  Company
                </th>

                <th className="text-left p-4">
                  Price
                </th>

                <th className="text-left p-4">
                  Stock
                </th>

              </tr>

            </thead>

            <tbody>

              {products.map((product: any) => (

                <tr
                  key={product._id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-4">
                    {product.name}
                  </td>

                  <td className="p-4">
                    {product.company}
                  </td>

                  <td className="p-4">
                    ₹{product.offerPrice}
                  </td>

                  <td className="p-4">
                    {product.stock}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}