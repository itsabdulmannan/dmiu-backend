const handleImage = {

    uploadImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Please upload a file' });
            }
            const imageUrl = `/images/${req.file.filename}`

            return res.status(200).json({ status: true, message: "Image uploaded successfully.", imageUrl });

        } catch (error) {
            console.error('Error uploading image:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    getFullimageUrl: async (req, res) => {
        const { path } = req.query;

        if (!path) {
            return res.status(400).json({ status: false, message: 'Path is required' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fullUrl = `${baseUrl}${path}`;

        res.json({ status: true, fullUrl });
    }
}
module.exports = handleImage;