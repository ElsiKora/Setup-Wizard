import type { ECiModule } from "../../../domain/enum/ci-module.enum";
import type { ECiProvider } from "../../../domain/enum/ci-provider.enum";

export interface IConfigCi {
	isEnabled?: boolean;
	moduleProperties?: Partial<
		Record<
			ECiModule,
			| {
					[propName: string]: any;
					isEnabled?: boolean;
			  }
			| boolean
		>
	>;
	modules?: Array<ECiModule>;
	provider?: ECiProvider;
}
