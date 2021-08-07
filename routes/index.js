const express = require("express");
const router = express.Router();
const general = require("../controllers/general");
const queries = require("../controllers/queries");

router.get("/general", general.get);

router.get("/mysql-query", queries.selectAll);

router.get("/select-all", queries.selectAll);
router.get("/select-one", queries.selectOne);
router.get("/select-multiple", queries.selectMultiple);

router.get("/find-one", queries.findOne);
router.get("/find-multiple", queries.findMultiple);
router.get("/filter-raw", queries.filterRaw);

router.get("/order-asc", queries.orderAsc);
router.get("/order-desc", queries.orderDesc);

router.get("/filter-order-asc", queries.filterOrderAsc);
router.get("/filter-order-desc", queries.filterOrderDesc);
router.get("/filter-raw-order-asc", queries.filterRawOrderAsc);

router.get("/join-table", queries.joinTable);

router.get("/select-as", queries.selectAs);
router.get("/select-select-as", queries.selectSelectAs);
router.get("/select-as-string-function", queries.selectAsStringFunction);

router.get("/count", queries.count);
router.get("/sum", queries.sum);
router.get("/avg", queries.avg);
router.get("/concat", queries.concat);
router.get("/sum-count-avg", queries.sumCountAvg);

module.exports = router;
