import { run } from "hardhat";

export async function verify(contractAddress: string, args: any[]) {
  console.log("🔍 Verificando contrato...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contrato ya verificado");
    } else {
      console.log("❌ Error durante la verificación:", error);
    }
  }
}

