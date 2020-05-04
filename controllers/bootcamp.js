// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Get All bootcamps' });
};

// @desc        Get single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Get single bootcamps' });
};

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      private
exports.createBootcamp = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Create new bootcamp' });
};

// @desc        Upadate a bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      private
exports.updateBootcamp = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Update a bootcamp' });
};

// @desc        Delete a bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      private
exports.deleteBootcamp = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Delete a bootcamp' });
};
