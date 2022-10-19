import axios from "axios";
import { humanizeAmount, zeroDecimalCurrencies } from "medusa-core-utils";
import { BaseService } from "medusa-interfaces";

class MSTeamsService extends BaseService {
	/**
	 * @param {Object} options - options defined in `medusa-config.js`
	 *    {
	 *      show_discount_code: If set to true the discount code used will be
	 *        displayed in the order channel.
	 *      teams_url: "https://hooks.slack.com/services/...",
	 *      admin_orders_url: "https:..../orders"
	 *    }
	 */
	constructor({ orderService, totalsService, regionService }, options) {
		super();

		this.orderService_ = orderService;

		this.totalsService_ = totalsService;

		this.regionService_ = regionService;

		this.options_ = options;
	}

	async orderNotification(orderId) {
		const order = await this.orderService_.retrieve(orderId, {
			select: [
				"shipping_total",
				"discount_total",
				"tax_total",
				"refunded_total",
				"gift_card_total",
				"subtotal",
				"total",
			],
			relations: [
				"customer",
				"billing_address",
				"shipping_address",
				"discounts",
				"discounts.rule",
				"shipping_methods",
				"payments",
				"fulfillments",
				"returns",
				"gift_cards",
				"gift_card_transactions",
				"swaps",
				"swaps.return_order",
				"swaps.payment",
				"swaps.shipping_methods",
				"swaps.shipping_address",
				"swaps.additional_items",
				"swaps.fulfillments",
			],
		});

		const { subtotal, tax_total, discount_total, shipping_total, total } =
			order;

		const currencyCode = order.currency_code.toUpperCase();
		const getDisplayAmount = (amount) => {
			const humanAmount = humanizeAmount(amount, currencyCode);
			if (zeroDecimalCurrencies.includes(currencyCode.toLowerCase())) {
				return humanAmount;
			}
			return humanAmount.toFixed(2);
		};
		const payload = {
			type: "AdaptiveCard",
			body: [
				{
					type: "TextBlock",
					size: "Medium",
					weight: "Bolder",
					text: `Order *<${this.options_.admin_orders_url}/${order.id}|#${order.display_id}>* has been processed.`,
				},
				{
					type: "ColumnSet",
					columns: [
						{
							type: "Column",
							items: [
								{
									type: "TextBlock",
									weight: "Bolder",
									text: `${order.shipping_address.first_name} ${order.shipping_address.last_name} ${order.email}`,
									wrap: true,
								},
								{
									type: "TextBlock",
									spacing: "None",
									text: `${order.shipping_address.address_1}  \n  ${order.shipping_address.city
										}, ${order.shipping_address.country_code.toUpperCase()}`,
									isSubtle: true,
									wrap: true,
								},
							],
							width: "stretch",
						},
					],
				},
				{
					type: "FactSet",
					facts: [
						{
							title: "Subtotal",
							value: `${getDisplayAmount(subtotal)} ${currencyCode}`,
						},
						{
							title: "Shipping",
							value: `${getDisplayAmount(shipping_total)} ${currencyCode}`,
						},
						{
							title: "Discount Total",
							value: `${getDisplayAmount(discount_total)} ${currencyCode}`,
						},
						{
							title: "Tax",
							value: `${getDisplayAmount(tax_total)} ${currencyCode}`,
						},
						{
							title: "Total",
							value: `${getDisplayAmount(total)} ${currencyCode}`,
						},
						{
							title: "Gift Card Total",
							value: "Not set",
						},
						{
							title: "Promo Code",
							value: "Not set",
						},
						{
							title: "Total",
							value: "Not set",
						},
					],
				},
				{
					type: "Container",
					style: "emphasis",
					padding: {
						top: "small",
						left: "default",
						bottom: "small",
						right: "default",
					},
					items: [
						{
							type: "ColumnSet",
							columns: [
								{
									type: "Column",
									items: [
										{
											type: "TextBlock",
											weight: "Bolder",
											text: "Image",
										},
									],
									width: "stretch",
								},
								{
									type: "Column",
									items: [
										{
											type: "TextBlock",
											weight: "Bolder",
											text: "Item",
										},
									],
									width: "stretch",
								},
								{
									type: "Column",
									items: [
										{
											type: "TextBlock",
											weight: "Bolder",
											text: "Quantity",
										},
									],
									width: "stretch",
								},
								{
									type: "Column",
									items: [
										{
											type: "TextBlock",
											weight: "Bolder",
											text: "Cost",
										},
									],
									width: "stretch",
								},
							],
						},
					],
				}
			],
			$schema: "http://adaptivecards.io/schemas/adaptive-card.json",
			version: "1.4",
		};

		if (order.gift_card_total) {
			payload.body[3].facts.push({
				title: "Gift Card Total",
				value: `${getDisplayAmount(order.gift_card_total)} ${currencyCode}`,
			});
		}

		if (this.options_.show_discount_code) {
			order.discounts.forEach((d) => {
				payload.body[3].facts.push({
					title: `Promo Code ${d.code}`,
					text: `${d.rule.value}${d.rule.type === "percentage" ? "%" : ` ${currencyCode}`}`,
				},
				);
			});
		}
		//TODO: Add itens to table
		return axios.post(this.options_.teams_url, payload);
	}
}

export default MSTeamsService;
