import { PregnancyService } from "../services/PregnancyService.js";

export class PregnancyController {
  constructor() {
    this.pregnancyService = new PregnancyService();
  }

  create = async (req, res, next) => {
    try {
      const user = req.user; 
      const payload = req.body;

      const pregnancy = await this.pregnancyService.createPregnancy(
        user,
        payload,
      );

      return res.status(201).json({ success: true, data: pregnancy });
    } catch (error) {
      next(error);
    }
  };

  listByUser = async (req, res, next) => {
    try {
      const user = req.user;
      const items = await this.pregnancyService.listByUser(user);

      if (!items || items.length === 0) {
        return res.json({
          success: true,
          message: "No pregnancies found for this user",
          data: [],
        });
      }

      return res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const user = req.user;
      const pregnancy = await this.pregnancyService.getById(
        user,
        req.params.id,
      );
      return res.json({ success: true, data: pregnancy });
    } catch (error) {
      next(error);
    }
  };

  assignDoctor = async (req, res, next) => {
    try {
      const user = req.user;
      const { doctorId } = req.body;

      if (!doctorId) {
        return res
          .status(400)
          .json({ success: false, message: "doctorId is required" });
      }

      const pregnancy = await this.pregnancyService.assignDoctor(
        user,
        req.params.id,
        doctorId,
      );
      return res.json({ success: true, data: pregnancy });
    } catch (error) {
      next(error);
    }
  };

  assignMidwife = async (req, res, next) => {
    try {
      const user = req.user;
      const { midwifeId } = req.body;

      if (!midwifeId) {
        return res
          .status(400)
          .json({ success: false, message: "midwifeId is required" });
      }

      const pregnancy = await this.pregnancyService.assignMidwife(
        user,
        req.params.id,
        midwifeId,
      );
      return res.json({ success: true, data: pregnancy });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req, res, next) => {
    try {
      const user = req.user;
      const pregnancy = await this.pregnancyService.cancelPregnancy(
        user,
        req.params.id,
      );
      return res.json({ success: true, data: pregnancy });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const user = req.user;
      const pregnancy = await this.pregnancyService.updatePregnancy(
        user,
        req.params.id,
        req.body,
      );
      return res.json({ success: true, data: pregnancy });
    } catch (error) {
      next(error);
    }
  };
}
