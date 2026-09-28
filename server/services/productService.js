const Product = require('../models/Product');


const createProduct = async (
    name,
    price,
    description,
    category,
    image,
    inventory,
    seller
) => {

    const product = new Product({
        name,
        price,
        seller,
        description,
        category,
        image,
        inventory
    });

    await product.save();

    return product;
};


const getProducts = async (
    minPrice,
    maxPrice,
    category,
    seller,
    search,
    sort,
    page = 1,
    limit = 10,
    fields
) => {

    const filter = {};


    // Price filter
    if (minPrice) {
        filter.price = {
            $gte: Number(minPrice)
        };
    }

    if (maxPrice) {
        filter.price = {
            ...filter.price,
            $lte: Number(maxPrice)
        };
    }


    // Category filter
    if (category) {
        filter.category = category;
    }


    // Seller filter
    if (seller) {
        filter.seller = seller;
    }


    // Search
    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: search,
                    $options: 'i'
                }
            },
            {
                description: {
                    $regex: search,
                    $options: 'i'
                }
            }
        ];
    }


    // Pagination
    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(
        Math.max(Number(limit) || 10, 1),
        100
    );

    const skip = (pageNumber - 1) * limitNumber;


    // Query
    let query = Product.find(filter);


    // Sorting
    if (sort === 'price_asc') {
        query = query.sort({
            price: 1
        });
    }

    if (sort === 'price_desc') {
        query = query.sort({
            price: -1
        });
    }

    if (sort === 'newest') {
        query = query.sort({
            createdAt: -1
        });
    }


    // Field selection
    if (fields) {
        const selectedFields = fields
            .split(',')
            .join(' ');

        query = query.select(selectedFields);
    }


    // Pagination apply
    query = query
        .skip(skip)
        .limit(limitNumber);


    const products = await query;


    // Total products
    const totalProducts = await Product.countDocuments(filter);


    return {
        products,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            totalProducts,
            totalPages: Math.ceil(
                totalProducts / limitNumber
            )
        }
    };
};


const updateProduct = async (id, data) => {

    const product = await Product.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

    return product;
};


const deleteProduct = async (id) => {

    const product = await Product.findByIdAndDelete(id);

    return product;
};


module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
};